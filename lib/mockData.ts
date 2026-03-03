export type User = {
  id: number;
  name: string;
  completedToday: boolean;
  streak: number;
};

export const mockUsers: User[] = [
  { id: 1, name: "Isaac", completedToday: true, streak: 5 },
  { id: 2, name: "Ryan", completedToday: false, streak: 2 },
  { id: 3, name: "John", completedToday: true, streak: 7 },
  { id: 4, name: "Jake B.", completedToday: false, streak: 1 },
  { id: 5, name: "Jake N.", completedToday: true, streak: 4 },
  { id: 6, name: "Brandon", completedToday: false, streak: 0 },
  { id: 7, name: "Ben", completedToday: true, streak: 3 }
];

export const todayMission = {
  spiritual: "Read Romans 8 and pray for 10 focused minutes.",
  physical: "Complete a 30-minute workout. No junk food.",
  leadership: "Initiate prayer with your wife or encourage a brother."
};

