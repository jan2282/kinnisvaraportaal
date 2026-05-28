// Käsitsi kirjutatud andmebaasi tüübid (vastavad supabase/migrations/0001_init.sql).
// Hoia sünkroonis migratsiooniga.
//
// NB: kasuta `type` (mitte `interface`) ridade/tabelite jaoks. supabase-js nõuab,
// et Row/Insert/Update oleksid määratavad `Record<string, unknown>`-iks; `interface`
// seda pole (puudub implitsiitne index signature), mille tõttu klient langeb tagasi
// `never` tüüpidele ja kõik päringud kaotavad tüübid.

export type UserRole = "buyer" | "seller" | "both";
export type ListingType = "apartment" | "house" | "land" | "commercial";
export type ListingCondition = "new" | "renovated" | "good" | "needs_renovation";
export type ListingStatus = "draft" | "active" | "under_offer" | "sold";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type InquiryStatus = "open" | "closed";
export type ViewingStatus = "pending" | "confirmed" | "cancelled";
export type BookingStatus = "requested" | "confirmed" | "completed";
export type EnergyClass = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string | null;
  parish: string | null;
  county: string | null;
  price: number | null;
  size_m2: number | null;
  rooms: number | null;
  floor: number | null;
  floors_total: number | null;
  year_built: number | null;
  type: ListingType;
  condition: ListingCondition | null;
  has_debt: boolean;
  has_co_owners: boolean;
  has_tenants: boolean;
  energy_class: EnergyClass | null;
  status: ListingStatus;
  views: number;
  created_at: string;
  updated_at: string;
}

export type ListingImage = {
  id: string;
  listing_id: string;
  url: string;
  order_index: number;
  is_cover: boolean;
  created_at: string;
}

export type ListingFeature = {
  id: string;
  listing_id: string;
  feature: string;
}

export type Inquiry = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
}

export type Message = {
  id: string;
  inquiry_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export type ClosingProgress = {
  notary?: boolean;
  preliminary_contract?: boolean;
  notarial_contract?: boolean;
  land_registry?: boolean;
}

export type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  closing_progress: ClosingProgress;
  created_at: string;
  updated_at: string;
}

export type Viewing = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  proposed_date: string | null;
  proposed_time: string | null;
  status: ViewingStatus;
  created_at: string;
}

export type PhotographerBooking = {
  id: string;
  listing_id: string | null;
  seller_id: string;
  name: string | null;
  address: string | null;
  preferred_dates: string[] | null;
  preferred_time: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
}

export type SavedListing = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

type Row<T> = T;
type Insert<T, Optional extends keyof T = never> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>;
type Update<T> = Partial<T>;

type TableDef<R, I, U> = { Row: R; Insert: I; Update: U; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Insert<Profile, "created_at" | "role" | "full_name" | "phone" | "avatar_url">,
        Update<Profile>
      >;
      listings: TableDef<
        Listing,
        Insert<
          Listing,
          | "id"
          | "created_at"
          | "updated_at"
          | "views"
          | "status"
          | "has_debt"
          | "has_co_owners"
          | "has_tenants"
          | "description"
          | "address"
          | "city"
          | "parish"
          | "county"
          | "price"
          | "size_m2"
          | "rooms"
          | "floor"
          | "floors_total"
          | "year_built"
          | "condition"
          | "energy_class"
        >,
        Update<Listing>
      >;
      listing_images: TableDef<
        ListingImage,
        Insert<ListingImage, "id" | "created_at" | "order_index" | "is_cover">,
        Update<ListingImage>
      >;
      listing_features: TableDef<
        ListingFeature,
        Insert<ListingFeature, "id">,
        Update<ListingFeature>
      >;
      inquiries: TableDef<
        Inquiry,
        Insert<Inquiry, "id" | "created_at" | "status" | "message">,
        Update<Inquiry>
      >;
      messages: TableDef<
        Message,
        Insert<Message, "id" | "created_at" | "is_read">,
        Update<Message>
      >;
      offers: TableDef<
        Offer,
        Insert<
          Offer,
          "id" | "created_at" | "updated_at" | "status" | "closing_progress" | "message"
        >,
        Update<Offer>
      >;
      viewings: TableDef<
        Viewing,
        Insert<Viewing, "id" | "created_at" | "status" | "proposed_date" | "proposed_time">,
        Update<Viewing>
      >;
      photographer_bookings: TableDef<
        PhotographerBooking,
        Insert<
          PhotographerBooking,
          | "id"
          | "created_at"
          | "status"
          | "listing_id"
          | "name"
          | "address"
          | "preferred_dates"
          | "preferred_time"
          | "notes"
        >,
        Update<PhotographerBooking>
      >;
      saved_listings: TableDef<
        SavedListing,
        Insert<SavedListing, "id" | "created_at">,
        Update<SavedListing>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      listing_type: ListingType;
      listing_condition: ListingCondition;
      listing_status: ListingStatus;
      offer_status: OfferStatus;
      inquiry_status: InquiryStatus;
      viewing_status: ViewingStatus;
      booking_status: BookingStatus;
      energy_class: EnergyClass;
    };
  };
}
