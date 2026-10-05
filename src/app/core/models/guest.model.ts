export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  personalNumber: string;
  phoneNumber: string;
}

export interface UpdateGuest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
