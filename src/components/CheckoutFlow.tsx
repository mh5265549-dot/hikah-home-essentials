import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Minus, Plus, Trash2, CreditCard, Truck, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Step = "cart" | "info" | "payment" | "success";

interface CheckoutFlowProps {
  onClose: () => void;
}

const CheckoutFlow = ({ onClose }: CheckoutFlowProps) => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleProceed = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setStep("info");
  };

  const handleSubmitInfo = () => {
    if (!name.trim() || !address.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setStep("payment");
  };

  const handlePayment = (method: string) => {
    const orderPayload = {
      customerName: name,
      phone,
      address,
      items: items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: totalPrice,
      paymentMethod: method,
    };

    toast.success(`Order placed via ${method}!`);
    setStep("success");

    // Persist order, then trigger the voice notification by order id only.
    (async () => {
      try {
        const { data: inserted, error } = await supabase
          .from("orders")
          .insert({
            customer_name: orderPayload.customerName,
            phone: orderPayload.phone,
            address: orderPayload.address,
            items: orderPayload.items,
            total: orderPayload.total,
            payment_method: orderPayload.paymentMethod,
          })
          .select("id")
          .single();
        if (error) throw error;

        const { data, error: fnErr } = await supabase.functions.invoke(
          "order-voice-notification",
          { body: { orderId: inserted.id } }
        );
        if (fnErr) throw fnErr;
        if (data instanceof Blob) {
          const url = URL.createObjectURL(data);
          const audio = new Audio(url);
          audio.play().catch((e) => console.warn("Audio autoplay blocked:", e));
        }
      } catch (e) {
        console.error("Order/notification failed:", e);
      }
    })();

    clearCart();
  };

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-2">Thank you, {name}!</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            Your groceries will be delivered to <strong>{address}</strong>. We'll call you at <strong>{phone}</strong>.
          </p>
          <Button onClick={onClose} className="rounded-full px-8">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === "cart") onClose();
            else if (step === "info") setStep("cart");
            else if (step === "payment") setStep("info");
          }}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground">
          {step === "cart" && "Your Cart"}
          {step === "info" && "Delivery Info"}
          {step === "payment" && "Payment"}
        </h2>
        <button onClick={onClose} className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Steps indicator */}
      <div className="px-4 py-3 flex items-center gap-2 justify-center">
        {["cart", "info", "payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["cart", "info", "payment"].indexOf(step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === "cart" && (
          <div className="max-w-lg mx-auto space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">Your cart is empty</p>
                <Button onClick={onClose} variant="outline" className="mt-4 rounded-full">
                  Browse Products
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Rs. {item.product.price} / {item.product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-bold text-primary min-w-[70px] text-right">
                    Rs. {item.product.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {step === "info" && (
          <div className="max-w-lg mx-auto space-y-5">
            <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
              <h3 className="font-bold text-foreground">Your Details</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full address" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 card-shadow">
              <h3 className="font-bold text-foreground mb-3">Order Summary</h3>
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">Rs. {item.product.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border mt-3 pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">Rs. {totalPrice}</span>
              </div>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="max-w-lg mx-auto space-y-4">
            <h3 className="font-bold text-foreground text-lg text-center mb-6">
              Choose Payment Method
            </h3>
            <button
              onClick={() => handlePayment("Cash on Delivery")}
              className="w-full bg-card rounded-xl p-6 card-shadow hover:card-hover-shadow transition-all flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                <Truck className="w-7 h-7 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
              </div>
            </button>
            <button
              onClick={() => handlePayment("Online Payment")}
              className="w-full bg-card rounded-xl p-6 card-shadow hover:card-hover-shadow transition-all flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">Online Payment</p>
                <p className="text-sm text-muted-foreground">Pay securely with card or bank</p>
              </div>
            </button>

            <div className="bg-muted rounded-xl p-4 mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-primary text-lg">Rs. {totalPrice}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step === "cart" && items.length > 0 && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">Rs. {totalPrice}</p>
            </div>
            <Button onClick={handleProceed} size="lg" className="rounded-full px-8">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {step === "info" && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleSubmitInfo} size="lg" className="w-full rounded-full">
              Continue to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutFlow;
