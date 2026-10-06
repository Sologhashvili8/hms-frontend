import { Hotel } from './hotel.model';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  managedHotelId: number | null;
  managedHotelName: string | null;
}

export interface AdminHotel extends Hotel {
  roomsCount: number;
  managerId: string | null;
  managerName: string | null;
  managerEmail: string | null;
}

export interface ManagerProfile {
  id: string;
  firstName: string;
  lastName: string;
  personalNumber: string;
  email: string;
  phoneNumber: string;
  hotelId: number;
  hotelName: string;
}
