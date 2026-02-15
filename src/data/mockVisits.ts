import { addDays, subDays, format, setHours, setMinutes, addMinutes } from "date-fns";
import { Visit, VisitStatus, CareRecipient, VisitTask } from "@/store/visitStore";

// Mock care recipients
const careRecipients: CareRecipient[] = [
  {
    id: "cr-1",
    firstName: "Eleanor",
    lastName: "Martinez",
    fullName: "Eleanor Martinez",
    phoneNumber: "(555) 123-4567",
    profilePicture: "https://i.pravatar.cc/150?u=eleanor",
  },
  {
    id: "cr-2",
    firstName: "Robert",
    lastName: "Johnson",
    fullName: "Robert Johnson",
    phoneNumber: "(555) 234-5678",
    profilePicture: "https://i.pravatar.cc/150?u=robert",
  },
  {
    id: "cr-3",
    firstName: "Margaret",
    lastName: "Chen",
    fullName: "Margaret Chen",
    phoneNumber: "(555) 345-6789",
    profilePicture: "https://i.pravatar.cc/150?u=margaret",
  },
  {
    id: "cr-4",
    firstName: "William",
    lastName: "Thompson",
    fullName: "William Thompson",
    phoneNumber: "(555) 456-7890",
    profilePicture: "https://i.pravatar.cc/150?u=william",
  },
  {
    id: "cr-5",
    firstName: "Patricia",
    lastName: "Davis",
    fullName: "Patricia Davis",
    phoneNumber: "(555) 567-8901",
    profilePicture: null,
  },
];

// Mock addresses
const addresses = [
  {
    street: "123 Oak Street",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    formatted: "123 Oak Street, Springfield, IL 62701",
  },
  {
    street: "456 Maple Avenue",
    city: "Columbus",
    state: "OH",
    zipCode: "43215",
    formatted: "456 Maple Avenue, Columbus, OH 43215",
  },
  {
    street: "789 Pine Road",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    formatted: "789 Pine Road, Austin, TX 78701",
  },
  {
    street: "321 Cedar Lane",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85001",
    formatted: "321 Cedar Lane, Phoenix, AZ 85001",
  },
  {
    street: "654 Birch Drive",
    city: "Denver",
    state: "CO",
    zipCode: "80201",
    formatted: "654 Birch Drive, Denver, CO 80201",
  },
];

// Mock task templates
const taskTemplates: Omit<VisitTask, "id" | "completed">[][] = [
  [
    { title: "Medication Administration", description: "Morning medications" },
    { title: "Personal Care Assistance", description: "Bathing and grooming" },
    { title: "Meal Preparation", description: "Prepare breakfast" },
  ],
  [
    { title: "Vital Signs Check", description: "Blood pressure, temperature" },
    { title: "Light Housekeeping", description: "Bedroom and bathroom" },
    { title: "Companionship", description: "Social interaction and activities" },
  ],
  [
    { title: "Medication Administration", description: "Evening medications" },
    { title: "Mobility Assistance", description: "Walking exercises" },
    { title: "Meal Preparation", description: "Prepare dinner" },
    { title: "Documentation", description: "Complete care notes" },
  ],
];

// Visit times (hours of the day)
const visitTimes = [8, 10, 12, 14, 16, 18];
const visitDurations = [60, 90, 120, 180]; // minutes

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateVisitId(date: Date, index: number): string {
  return `visit-${format(date, "yyyyMMdd")}-${index}`;
}

function generateTasksForVisit(visitId: string, taskIndex: number): VisitTask[] {
  const template = taskTemplates[taskIndex % taskTemplates.length];
  return template.map((task, i) => ({
    id: `${visitId}-task-${i}`,
    title: task.title,
    description: task.description,
    completed: false,
  }));
}

function getStatusForDate(date: Date, today: Date): VisitStatus {
  const daysDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 0) {
    return "scheduled";
  } else if (daysDiff === 0) {
    // Today: mix of statuses
    const rand = Math.random();
    if (rand < 0.3) return "completed";
    if (rand < 0.5) return "in_progress";
    return "scheduled";
  } else {
    // Past: mostly completed, some missed
    const rand = Math.random();
    if (rand < 0.85) return "completed";
    if (rand < 0.95) return "missed";
    return "cancelled";
  }
}

export function generateMockVisits(startDate: Date, endDate: Date): Visit[] {
  const visits: Visit[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = new Date(startDate);
  let visitIndex = 0;
  
  while (currentDate <= endDate) {
    // Generate 1-4 visits per day
    const visitsForDay = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < visitsForDay; i++) {
      const careRecipient = careRecipients[visitIndex % careRecipients.length];
      const address = addresses[visitIndex % addresses.length];
      const startHour = visitTimes[i % visitTimes.length];
      const duration = getRandomElement(visitDurations);
      
      const scheduledStart = setMinutes(setHours(new Date(currentDate), startHour), 0);
      const scheduledEnd = addMinutes(scheduledStart, duration);
      const status = getStatusForDate(currentDate, today);
      
      // Generate actual clock times for completed/in_progress visits
      let actualClockIn: string | null = null;
      let actualClockOut: string | null = null;
      
      if (status === "completed" || status === "in_progress") {
        // Clock in within 15 minutes of scheduled start
        const clockInOffset = Math.floor(Math.random() * 30) - 15;
        actualClockIn = addMinutes(scheduledStart, clockInOffset).toISOString();
        
        if (status === "completed") {
          // Clock out within 15 minutes of scheduled end
          const clockOutOffset = Math.floor(Math.random() * 30) - 15;
          actualClockOut = addMinutes(scheduledEnd, clockOutOffset).toISOString();
        }
      }
      
      const visit: Visit = {
        id: generateVisitId(currentDate, i),
        careRecipient,
        address,
        scheduledDate: format(currentDate, "yyyy-MM-dd"),
        scheduledStartTime: scheduledStart.toISOString(),
        scheduledEndTime: scheduledEnd.toISOString(),
        scheduledDuration: duration,
        actualClockIn,
        actualClockOut,
        status,
        tasks: generateTasksForVisit(generateVisitId(currentDate, i), visitIndex),
        notes: status === "completed" 
          ? "Visit completed successfully. Client was in good spirits."
          : status === "missed"
            ? "Unable to reach client. Follow-up required."
            : null,
      };
      
      visits.push(visit);
      visitIndex++;
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return visits;
}

// Generate initial mock data (7 days past to 14 days future)
const today = new Date();
export const mockVisits = generateMockVisits(subDays(today, 7), addDays(today, 14));
