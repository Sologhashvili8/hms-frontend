export interface Hotel {
  id: number;
  name: string;
  rating: number;
  country: string;
  city: string;
  address: string;
  imageUrl: string;
}

export interface CreateHotel {
  name: string;
  rating: number;
  country: string;
  city: string;
  address: string;
  imageUrl?: string;
}

export interface UpdateHotel {
  name: string;
  address: string;
  rating: number;
  imageUrl?: string;
}

export interface HotelFilter {
  country?: string;
  city?: string;
  rating?: number;
}
