import Header from "@/components/Header";
import { Car } from "lucide-react";

const RENTALS = [
  { name:"Jeep Lava Tour Merapi", type:"4WD Jeep", price:"Rp 350,000/trip", provider:"Merapi Lava Tour", available:12 },
  { name:"Sepeda Motor Honda Beat", type:"Motorcycle", price:"Rp 75,000/day", provider:"Jogja Rent Motor", available:45 },
  { name:"Toyota Avanza", type:"MPV Car", price:"Rp 450,000/day", provider:"Sewa Mobil Jogja", available:8 },
  { name:"Electric Bicycle", type:"E-Bike", price:"Rp 120,000/day", provider:"GreenRide Jogja", available:20 },
  { name:"Becak Wisata", type:"Traditional Pedicab", price:"Rp 50,000/hour", provider:"Becak Heritage Tour", available:30 },
];

export default function RentalsPage() {
  return (
    <>
      <Header activeId="rentals" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Vehicle Rentals</h2>
            <p className="text-xs text-gray-500 mt-1">Manage transportation rental listings, providers, and availability.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Car className="w-4 h-4" /><span>Add Rental</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RENTALS.map(r => (
            <div key={r.name} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4 hover:border-primary/20 transition-premium">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Car className="w-5 h-5" />
                </div>
                <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">{r.available} available</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-display">{r.name}</h4>
                <span className="text-[10px] text-gray-500">{r.type}</span>
              </div>
              <div className="border-t border-border pt-3 space-y-1 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="font-bold text-primary">{r.price}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Provider</span><span className="font-medium text-gray-600">{r.provider}</span></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
