<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Complete Multi-dimensional Analysis
  == Menampilkan semua dimensi untuk cross-filtering maksimal
  == Salesperson x Product x Time
  --%>

<jp:mondrianQuery id="query01" 
    jdbcDriver="com.mysql.cj.jdbc.Driver" 
    jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=" 
    catalogUri="/WEB-INF/queries/salesperson_retention.xml">

SELECT 
  NON EMPTY {
    [Time].[Year].Members
  } ON COLUMNS,
  NON EMPTY {
    Crossjoin(
      [Salesperson].[Salesperson Name].Members,
      [Product].[Product Category].Members
    )
  } ON ROWS
FROM [Retention]
WHERE [Measures].[Total Sales]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Multi-dimensional Analysis - Salesperson x Product Category x Time (Cross-filter enabled)</c:set>
