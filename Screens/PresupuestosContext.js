import { Children, createContext, useEffect, useState } from "react";
import db from "../database/finanzasBD";
export const PresupuestosContext =createContext();

export const PresupuestosProvider =({Children})=>{
  const [presupuestos, setPresupuestos]=useState([]);

  useEffect(()=>{
    cargarPresupuestos();
  },[]);

  const cargarPresupuestos = ()=>{
    db.transaction(tx=>{
      tx.executeSql(
        "SELECT * FROM presupuestos",
        [],
        (_,res)=>setPresupuestos(res.rows._array)
      );
    });
  };

  const agregarPresupuesto = (p)=>{
    db.transaccion(tx=>{
      tx.executeSql(
        "INSERT INTO presupuestos(nombre,monto, fecha) VALUES (?,?,?);",
        [p.nombre, p.monto, p.fecha],
        ()=> cargarPresupuestos()
      );
    });
  };

  const editarPresupuesto=(p)=>{
    db.transaccion(tx=>{
      tx.executeSql(
        "UPDATE presupuestos SET nombre=?, monto=?, fecha=? WHERE id=?;",
        [p.nombre, p.monto, p.fecha, p.id],
        ()=>cargarPresupuestos()
      );
    });
  };

  const eliminarPresupuesto=(id)=>{
    db.transaccion(tx=>{
      tx.executeSql(
        "DELETE FROM presupuestos WHERE id=?;",
        [id],
        ()=>cargarPresupuestos()
      );
    });
  };

  return(<PresupuestosContext.Provider value={{presupuestos, agregarPresupuesto, editarPresupuesto, eliminarPresupuesto}}>
    {children}
  </PresupuestosContext.Provider>
  );
}