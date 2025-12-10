<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Salesperson Retention by Territory
  == Menampilkan analisis retention dengan hierarchy territory
  --%>

<jp:mondrianQuery id="query01" 
    jdbcDriver="com.mysql.cj.jdbc.Driver" 
    jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=" 
    catalogUri="/WEB-INF/queries/salesperson_retention.xml">

SELECT 
  {
    [Measures].[Total Sales],
    [Measures].[Total Customers],
    [Measures].[Total Orders],
    [Measures].[Total Profit],
    [Measures].[Avg Sales Per Customer]
  } ON COLUMNS,
  NON EMPTY {
    [Territory].[Territory Name].Members
  } ON ROWS
FROM [Retention]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Retention by Territory - Drill-down (Group > Region > Territory)</c:set>
