import { createContext, useState, useEffect } from "react";
import db from "../database/finanzasBD";

export const TransaccionesContext = createContext();

export const TransaccionesProvider = ({ children }) => {

  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const cargarTransacciones = () => {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM transacciones ORDER BY fecha DESC;",
        [],
        (_, res) => setTransacciones(res.rows._array)
      );
    });
  };

  const agregarTransaccion = (t) => {
    db.transaction(tx => {
      tx.executeSql(
        "INSERT INTO transacciones (tipo, categoria, monto, fecha) VALUES (?, ?, ?, ?);",
        [t.tipo, t.categoria, t.monto, t.fecha],
        () => cargarTransacciones()
      );
    });
  };

  const obtenerEgresosPorCategoria = (categoria) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT monto FROM transacciones WHERE tipo='Egreso' AND categoria=?;",
          [categoria],
          (_, res) => {
            const total = res.rows._array.reduce((sum, r) => sum + r.monto, 0);
            resolve(total);
          },
          (_, e) => reject(e)
        );
      });
    });
  };

  return (
    <TransaccionesContext.Provider value={{ transacciones, agregarTransaccion, obtenerEgresosPorCategoria }}>
      {children}
    </TransaccionesContext.Provider>
  );
};
