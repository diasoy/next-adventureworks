<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Salesperson Retention Analysis Query
  == Menampilkan detail retention per salesperson dengan berbagai metrik
  == Termasuk: Total Sales, Total Orders, Total Customers, dan metrik perhitungan
  --%>

<jp:mondrianQuery id="query01" 
    jdbcDriver="com.mysql.cj.jdbc.Driver" 
    jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=" 
    catalogUri="/WEB-INF/queries/salesperson_retention.xml">

SELECT 
  {
    [Measures].[Total Sales],
    [Measures].[Total Orders],
    [Measures].[Total Customers],
    [Measures].[Total Profit],
    [Measures].[Avg Sales Per Customer],
    [Measures].[Avg Orders Per Customer],
    [Measures].[Profit Margin %]
  } ON COLUMNS,
  {
    Hierarchize(
      {[Salesperson].[Territory].Members, [Salesperson].[Salesperson Name].Members}
    )
  } ON ROWS
FROM [Retention]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Detail Retention per Salesperson - OLAP Analysis (Drill-down: Territory > Salesperson)</c:set>
