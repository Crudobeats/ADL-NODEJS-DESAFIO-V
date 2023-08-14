const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "drew214,",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const PAGE_SIZE = 5;

const obtenerJoyas = async ({ limit = PAGE_SIZE, order_by = "id_ASC", page = 1 }) => {
  const offset = (page - 1) * limit;
  const [nombre, categoria] = order_by.split("_");
  const consulta = {
    text: `SELECT * FROM inventario ORDER BY $1:name $2:raw LIMIT $3 OFFSET $4`,
    values: [nombre, categoria, limit, offset],
  };
  const { rows } = await pool.query(consulta);
  return rows;
};

const JoyasPorId = async (id) => {
  const consulta = {
    text: `SELECT * FROM inventario WHERE id = $1`,
    values: [id],
  };
  const { rows } = await pool.query(consulta);
  return rows.length > 0 ? rows : null;
};

const filtrarJoyas = async ({
  metal,
  categoria,
  precio_max,
  precio_min,
  limit = PAGE_SIZE,
  order_by = "id_ASC",
  page = 1,
}) => {
  const values = [];
  let filtros = [];

  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    filtros.push(`${campo} ${comparador} $${length}`);
  };
  if (metal) agregarFiltro("metal", "=", metal);
  if (categoria) agregarFiltro("categoria", "=", categoria);
  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (precio_min) agregarFiltro("precio", ">=", precio_min);

  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    consulta += ` WHERE ${filtros.join(" AND ")}`;
  }

  const offset = (page - 1) * limit;
  const [campoOrden, categoriaOrden] = order_by.split("_");
  consulta += ` ORDER BY $1:name $2:raw LIMIT $3 OFFSET $4`;

  values.unshift(campoOrden, categoriaOrden, limit, offset);
  const { rows: inventario } = await pool.query(consulta, values);
  const total = parseInt(totalRows[0].count);
  return {total, results : inventario};
};

module.exports = { obtenerJoyas, filtrarJoyas, JoyasPorId };
