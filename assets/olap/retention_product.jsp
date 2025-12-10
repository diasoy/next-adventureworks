<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Salesperson Retention - Multi-dimensional Drill-down
  == Drill-down across multiple dimensions:
  == - Product: Category > Subcategory > Product
  == - Customer: Segment > Customer
  == - Salesperson: Territory > Salesperson
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
    [Measures].[Profit Margin %]
  } ON COLUMNS,
  {
    Hierarchize(
      Union(
        {[Product].[Product Category].Members},
        Union(
          {[Product].[Product Subcategory].Members},
          {[Product].[Product Name].Members}
        )
      )
    )
  } ON ROWS
FROM [Retention]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Retention by Product - Drill-down (Category > Subcategory > Product)</c:set>
