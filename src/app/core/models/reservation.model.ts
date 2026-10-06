export interface Reservation {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  guestId: string;
  roomIds: number[];
}

export interface CreatePayment {
  cardNumber: string;
  phoneNumber: string;
  personalNumber: string;
}

export interface CreateReservation {
  checkInDate: string;
  checkOutDate: string;
  roomIds: number[];
  payment: CreatePayment;
}

export interface MyReservation {
  id: number;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelImageUrl: string;
  roomNames: string[];
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
}

export interface StaffReservation {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestPersonalNumber: string;
  roomNames: string[];
  nights: number;
  totalPrice: number;
}

export interface CreateStaffReservation {
  firstName: string;
  lastName: string;
  personalNumber: string;
  phoneNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomIds: number[];
}
