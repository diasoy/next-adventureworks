<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Customer Retention Analysis with Drill-down
  == Drill-down: Customer Segment > Individual Customer
  == Cross-filter dengan Time dimension di columns
  --%>

<jp:mondrianQuery id="query01" 
    jdbcDriver="com.mysql.cj.jdbc.Driver" 
    jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=" 
    catalogUri="/WEB-INF/queries/salesperson_retention.xml">

SELECT 
  {
    [Measures].[Total Sales],
    [Measures].[Total Orders],
    [Measures].[Avg Sales Per Customer]
  } ON COLUMNS,
  NON EMPTY {
    TopCount(
      [Customer].[Customer Name].Members,
      100,
      [Measures].[Total Sales]
    )
  } ON ROWS
FROM [Retention]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Top 100 Customers by Total Sales - Customer Retention Analysis</c:set>
