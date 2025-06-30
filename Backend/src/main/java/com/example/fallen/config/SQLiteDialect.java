// package com.example.fallen.config;

// import org.hibernate.dialect.Dialect;
// import org.hibernate.dialect.identity.IdentityColumnSupport;
// import org.hibernate.dialect.identity.IdentityColumnSupportImpl;

// import java.sql.Types;

// public class SQLiteDialect extends Dialect {

//     public SQLiteDialect() {
//         registerColumnType(Types.INTEGER, "integer");
//         registerColumnType(Types.VARCHAR, "varchar");
//         registerColumnType(Types.BLOB, "blob");
//         registerColumnType(Types.FLOAT, "float");
//         registerColumnType(Types.DOUBLE, "double");
//         registerColumnType(Types.BOOLEAN, "boolean");
//     }

//     @Override
//     public IdentityColumnSupport getIdentityColumnSupport() {
//         return new IdentityColumnSupportImpl();
//     }

//     @Override
//     public boolean supportsIdentityColumns() {
//         return true;
//     }

//     @Override
//     public String getIdentityColumnString(int type) {
//         return "integer";
//     }

//     @Override
//     public String getIdentitySelectString(String table, String column, int type) {
//         return "select last_insert_rowid()";
//     }

//     @Override
//     public boolean supportsLimit() {
//         return true;
//     }

//     @Override
//     public String getLimitString(String query, boolean hasOffset) {
//         return query + (hasOffset ? " limit ? offset ?" : " limit ?");
//     }

//     @Override
//     public boolean bindLimitParametersInReverseOrder() {
//         return true;
//     }
// }

