export interface Worker {
  id: string;
  name: string;
  skill: string;
  phone: string;
  available: boolean;
  lat: number;
  lng: number;
}

// 10 Demo workers in Solapur, Maharashtra, India
export const demoWorkers: Worker[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    skill: "Plumber",
    phone: "+919876543210",
    available: true,
    lat: 17.6599,
    lng: 75.9064
  },
  {
    id: "2",
    name: "Suresh Patil",
    skill: "Electrician",
    phone: "+919823456789",
    available: true,
    lat: 17.6650,
    lng: 75.9100
  },
  {
    id: "3",
    name: "Anil Sharma",
    skill: "Carpenter",
    phone: "+919812345678",
    available: false,
    lat: 17.6700,
    lng: 75.9200
  },
  {
    id: "4",
    name: "Vikram Singh",
    skill: "Painter",
    phone: "+919834567890",
    available: true,
    lat: 17.6550,
    lng: 75.9000
  },
  {
    id: "5",
    name: "Mahesh Jadhav",
    skill: "Mason",
    phone: "+919845678901",
    available: true,
    lat: 17.6620,
    lng: 75.8950
  },
  {
    id: "6",
    name: "Santosh More",
    skill: "Plumber",
    phone: "+919856789012",
    available: false,
    lat: 17.6580,
    lng: 75.9150
  },
  {
    id: "7",
    name: "Ganesh Kulkarni",
    skill: "Electrician",
    phone: "+919867890123",
    available: true,
    lat: 17.6680,
    lng: 75.9050
  },
  {
    id: "8",
    name: "Ravi Deshmukh",
    skill: "AC Repair",
    phone: "+919878901234",
    available: true,
    lat: 17.6530,
    lng: 75.9120
  },
  {
    id: "9",
    name: "Prakash Gaikwad",
    skill: "Welder",
    phone: "+919889012345",
    available: false,
    lat: 17.6640,
    lng: 75.8980
  },
  {
    id: "10",
    name: "Deepak Bhosale",
    skill: "Carpenter",
    phone: "+919890123456",
    available: true,
    lat: 17.6720,
    lng: 75.9080
  }
];
