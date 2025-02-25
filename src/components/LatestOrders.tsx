import { Box, Paper, TextField, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { OrderInterface } from "../interface/orderInterface";
import { StyledTableCell } from "../style/styles";
import TableRowComponent from "./TableRowComponent"

const statusMap: { [key: string]: string } = {
  Pending: "#ffb84da9",
  Delivered: "#74ff03a0",
  Refunded: "#ff00009e",
};

export function LatestOrders() {
  const [orders, setOrders] = useState<OrderInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<OrderInterface[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get<OrderInterface[]>(
          `${import.meta.env.VITE_BASE_URL}orders`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const ordersData: OrderInterface[] = response.data;
        setOrders(ordersData);

        // Filter orders based on search term
        const filteredOrders = ordersData.filter(
          (order) =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingDetails?.address
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingDetails.orderType
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

        setFilteredOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}orders/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      console.error(`Error deleting order with ID ${orderId}:`, error);
    }
  };

  const handleChangeStatus = async (orderId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}orders/${orderId}`, {
        status: "Delivered",
      });

      const response = await axios.get<OrderInterface[]>(
        `${import.meta.env.VITE_BASE_URL}orders`,
        {
          headers: {
            Authorization: token, // Include the authorization token here as well
          },
        }
      );
  
      const updatedOrders: OrderInterface[] = response.data;
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Now error is narrowed down to AxiosError
        console.error(
          `Error changing status for order with ID ${orderId}:`,
          (error as AxiosError).response?.data || error.message
        );
      } else {
        console.error(
          `Unknown error changing status for order with ID ${orderId}:`,
          error
        );
      }
    }
  };
  return (
    <Box sx={{ margin: "20px" }}>
      <TextField
        label="Search"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <TableContainer component={Paper} sx={{ height: "80vh" }}>
        <Table sx={{}} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell align="center">Address</StyledTableCell>
              <StyledTableCell align="center">Price</StyledTableCell>
              <StyledTableCell align="center">Order Type</StyledTableCell>
              <StyledTableCell align="center">Status</StyledTableCell>
              <StyledTableCell align="center">Delete Order</StyledTableCell>
              <StyledTableCell align="center">Change Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchTerm
              ? filteredOrders.map((order) => (
                  <TableRowComponent
                    key={order._id}
                    order={order}
                    handleDeleteOrder={handleDeleteOrder}
                    handleChangeStatus={handleChangeStatus}
                    statusMap={statusMap}
                  />
                ))
              : orders.map((order) => (
                  <TableRowComponent
                    key={order._id}
                    order={order}
                    handleDeleteOrder={handleDeleteOrder}
                    handleChangeStatus={handleChangeStatus}
                    statusMap={statusMap}
                  />
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
