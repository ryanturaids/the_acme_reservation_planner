const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./db");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});
app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});
app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    const reservation = await createReservation({
      customer_id: req.params.id,
      restaurant_id: req.body.restaurant_id,
      party_count: req.body.party_count,
      date: req.body.date,
    });
    res.status(201).send(reservation);
  } catch (error) {
    next(error);
  }
});
app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("establishing connection to database");
  await client.connect();
  console.log("database connection");
  await createTables();
  console.log("created tables");
  const [
    evelyn,
    marcus,
    natalia,
    wesley,
    sophia,
    italianDeli,
    blueGrill,
    urbanBistro,
  ] = await Promise.all([
    createCustomer("evelyn"),
    createCustomer("marcus"),
    createCustomer("natalia"),
    createCustomer("wesley"),
    createCustomer("sophia"),
    createRestaurant("the italian deli"),
    createRestaurant("the blue grill"),
    createRestaurant("urban bistro"),
  ]);
  const [reservation1, reservation2] = await Promise.all([
    createReservation({
      customer_id: evelyn.id,
      restaurant_id: urbanBistro.id,
      party_count: 2,
      date: "08/16/24",
    }),
    createReservation({
      customer_id: marcus.id,
      restaurant_id: italianDeli.id,
      party_count: 3,
      date: "08/25/24",
    }),
  ]);

  console.log("database seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};
init();
