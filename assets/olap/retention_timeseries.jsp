<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<%--
  == Salesperson Retention Time Series Analysis
  == Menampilkan trend retention per salesperson dari waktu ke waktu
  --%>

<jp:mondrianQuery id="query01" 
    jdbcDriver="com.mysql.cj.jdbc.Driver" 
    jdbcUrl="jdbc:mysql://localhost:3306/next_adventureworks?user=root&password=" 
    catalogUri="/WEB-INF/queries/salesperson_retention.xml">

SELECT 
  {
    Hierarchize(
      Union(
        {[Time].[Year].Members},
        Union(
          {[Time].[Quarter].Members},
          {[Time].[Month].Members}
        )
      )
    )
  } ON COLUMNS,
  {
    Hierarchize(
      {[Salesperson].[Territory].Members, [Salesperson].[Salesperson Name].Members}
    )
  } ON ROWS
FROM [Retention]
WHERE [Measures].[Total Sales]

</jp:mondrianQuery>

<c:set var="title01" scope="session">Retention Time Series - Drill-down (Year > Quarter > Month) x (Territory > Salesperson)</c:set>
