import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  payment_method: string;
  created_at: string;
}

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const fetchOrders = async (pw: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-orders", {
      headers: { "x-admin-password": pw },
    });
    setLoading(false);

    const res = data as { error?: unknown; orders?: Order[] } | null;
    if (error || res?.error) {
      toast.error("Incorrect password or unable to load orders");
      return false;
    }
    setOrders(res?.orders ?? []);
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    const ok = await fetchOrders(password);
    if (ok) {
      setAuthed(true);
      sessionStorage.setItem("hikmah_admin_pw", password);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("hikmah_admin_pw");
    if (saved) {
      setPassword(saved);
      fetchOrders(saved).then((ok) => {
        if (ok) setAuthed(true);
        else sessionStorage.removeItem("hikmah_admin_pw");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-3">
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">HIKMAH Admin — Orders</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div>
                  <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.phone} · {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary">{order.payment_method}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Address
                  </p>
                  <p className="text-sm text-foreground">{order.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Items
                  </p>
                  <ul className="text-sm space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-muted-foreground">
                          Rs. {item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">
                    Rs. {order.total}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default Admin;