"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Booking {
  id: string;
  lead_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  project_name: string;
  unit_no: string;
  unit_type: string;
  carpet_area: string;
  agreement_value: string;
  booking_token_amount: string;
  payment_status: "TOKEN_RECEIVED" | "AGREEMENT_DONE" | "REGISTRATION_COMPLETE";
  booking_date: string;
  closing_manager: string;
  closing_manager_id: string;
  closing_executive: string;
  closing_executive_id: string;
  notes?: string;
}

let mockBookings: Booking[] = [
  {
    id: "bk_1",
    client_name: "Vikram Malhotra",
    client_phone: "+91 98201 92831",
    client_email: "vikram.m@gmail.com",
    project_name: "Tathastu Residency (Kharadi)",
    unit_no: "Tower B - Flat 804",
    unit_type: "3 BHK Luxury",
    carpet_area: "1,420 sq.ft.",
    agreement_value: "₹1,15,00,000",
    booking_token_amount: "₹10,00,000",
    payment_status: "TOKEN_RECEIVED",
    booking_date: "2026-09-14",
    closing_manager: "Anmol",
    closing_manager_id: "mgr_1",
    closing_executive: "Gayatri",
    closing_executive_id: "emp_1",
    notes: "Token received via RTGS. Drafting agreement for sale next Monday.",
  },
  {
    id: "bk_2",
    client_name: "Pooja Deshmukh",
    client_phone: "+91 98712 34509",
    client_email: "pooja.d@yahoo.com",
    project_name: "Tathastu Heights (Wakad)",
    unit_no: "Tower A - Flat 402",
    unit_type: "2 BHK Premium",
    carpet_area: "980 sq.ft.",
    agreement_value: "₹74,50,000",
    booking_token_amount: "₹7,50,000",
    payment_status: "AGREEMENT_DONE",
    booking_date: "2026-09-10",
    closing_manager: "Anmol",
    closing_manager_id: "mgr_1",
    closing_executive: "Gayatri",
    closing_executive_id: "emp_1",
    notes: "Bank loan pre-approved with HDFC. 20% milestone paid.",
  },
  {
    id: "bk_3",
    client_name: "Rajesh Kulkarni",
    client_phone: "+91 99887 76655",
    client_email: "rajesh.k@rediffmail.com",
    project_name: "Tathastu Greens (Baner)",
    unit_no: "Villa Signature 12",
    unit_type: "4 BHK Villa",
    carpet_area: "3,200 sq.ft.",
    agreement_value: "₹2,10,00,000",
    booking_token_amount: "₹25,00,000",
    payment_status: "REGISTRATION_COMPLETE",
    booking_date: "2026-09-02",
    closing_manager: "Priya Sharma",
    closing_manager_id: "mgr_2",
    closing_executive: "Vikram Malhotra",
    closing_executive_id: "emp_3",
    notes: "Full stamp duty paid and registered at sub-registrar office.",
  },
];

export function useBookings() {
  const queryClient = useQueryClient();

  const useGetBookings = () => {
    return useQuery({
      queryKey: ["bookings"],
      queryFn: async () => {
        return [...mockBookings];
      },
    });
  };

  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: Omit<Booking, "id" | "booking_date">) => {
      const booking: Booking = {
        ...newBooking,
        id: `bk_${Date.now()}`,
        booking_date: new Date().toISOString().split("T")[0],
      };
      mockBookings = [booking, ...mockBookings];
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: Booking["payment_status"];
    }) => {
      mockBookings = mockBookings.map((b) => {
        if (b.id === bookingId) {
          return { ...b, payment_status: status };
        }
        return b;
      });
      return mockBookings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return {
    useGetBookings,
    createBooking: createBookingMutation.mutateAsync,
    updateBookingStatus: updateBookingStatusMutation.mutateAsync,
  };
}
