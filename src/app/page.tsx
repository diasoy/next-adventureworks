import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function Home() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "+20.1% from last month",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Customers",
      value: "+2,350",
      description: "+180.1% from last month",
      icon: Users,
      trend: "up",
    },
    {
      title: "Sales",
      value: "+12,234",
      description: "+19% from last month",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Active Now",
      value: "+573",
      description: "+201 since last hour",
      icon: BarChart3,
      trend: "up",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your AdventureWorks CRM dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Overview of your recent sales and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be displayed here
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Your top performing customers this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00" },
                { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$1,799.00" },
                { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$1,299.00" },
              ].map((customer, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {customer.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{customer.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

