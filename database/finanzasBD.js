import * as SQLite from 'expo-sqlite'

const db  =SQLite.openDatabaseAsync("finanzas.db");

export const iniciarbd=()=>{
    db.transaction(tx=>{
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS transacciones(
            id INTERGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT,
            monto REAL,
            categoria TEXT,
            fecha TEXT
            );`
        );
    
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS presupuestos(
            id INTERGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            monto REAL,
            fecha TEXT
            );`
        );
    });
};

export default db;