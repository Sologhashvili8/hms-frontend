export interface Room {
  id: number;
  name: string;
  price: number;
  capacity: number;
  hotelId: number;
  amenities: string[];
  photoUrls: string[];
}

export interface CreateRoom {
  name: string;
  price: number;
  capacity: number;
  amenityIds: number[];
  photoUrls?: string[];
}

export interface UpdateRoom {
  name: string;
  price: number;
  capacity: number;
  amenityIds: number[];
  photoUrls?: string[];
}

export interface RoomFilter {
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface RoomListItem extends Room {
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  hotelRating: number;
}
