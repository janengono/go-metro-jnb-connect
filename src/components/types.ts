// types.ts
// src/components/types.ts
export type BusType = {
  id: string;
  name?: string;  // <-- make it optional
  bus_number: string;
  route_id: string;
  capacity: number;
  current_capacity: number;
  status: string;
};



