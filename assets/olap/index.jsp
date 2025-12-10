<%@page contentType="text/html"%>
<%--
// This software is subject to the terms of the Eclipse Public License v1.0
// Agreement, available at the following URL:
// http://www.eclipse.org/legal/epl-v10.html.
// You must accept the terms of that agreement to use this software.
//
// Copyright (C) 2001-2005 Julian Hyde
// Copyright (C) 2005-2010 Pentaho and others
// All Rights Reserved.
//
// jhyde, 6 August, 2001
--%>
<html>
<head>
<meta name="description" content="Mondrian is an OLAP server written in Java. It enables you to interactively
analyze very large datasets stored in SQL databases without writing SQL.">
<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
<title>OLAP WH SAKILA - Using Mondrian</title>
<link rel="stylesheet" href="stylesheet.css" type="text/css" />
</head>
<body>
<p>OLAP WHSAKILA</p>
<ul>
<ul>
  <li><a href="testpage.jsp?query=whsakila">PIVOT WHSAKILA</a></li>
  <li><a href="testpage.jsp?query=dwoadw1">DWOADW1 – Ringkasan</a></li>
  <li><a href="testpage.jsp?query=dwoadw2">DWOADW2 – Per Kategori</a></li>

</ul>

</ul>

<p>SALESPERSON RETENTION ANALYSIS</p>
<ul>
<ul>
  <li><a href="testpage.jsp?query=retention_salesperson">Detail Retention per Salesperson (Drill-down: Territory > Salesperson)</a></li>
  <li><a href="testpage.jsp?query=retention_territory">Retention by Territory (Drill-down: Group > Region > Territory)</a></li>
  <li><a href="testpage.jsp?query=retention_timeseries">Retention Time Series (Drill-down: Year > Quarter > Month)</a></li>
  <li><a href="testpage.jsp?query=retention_product">Retention by Product (Drill-down: Category > Subcategory > Product)</a></li>
  <li><a href="testpage.jsp?query=retention_customer">Customer Retention Analysis (Drill-down: Segment > Customer)</a></li>
  <li><a href="testpage.jsp?query=retention_multidim">Multi-dimensional Analysis (Cross-filter: Salesperson x Product x Time)</a></li>

</ul>

</ul>


</body>
</html>
