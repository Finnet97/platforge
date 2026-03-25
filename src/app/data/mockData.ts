export interface Trophy {
  id: number;
  gameTitle: string;
  platform: 'PS3' | 'PS4' | 'PS5' | 'Vita' | 'PSVR';
  dateEarned: string;
  rarity: number;
  timeToPlatinum: string;
  order: number;
  imageUrl: string;
}

export const mockTrophies: Trophy[] = [
  {
    id: 1,
    gameTitle: "God of War Ragnarök",
    platform: "PS5",
    dateEarned: "March 14, 2024",
    rarity: 3.42,
    timeToPlatinum: "47h 32m",
    order: 47,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    gameTitle: "Elden Ring",
    platform: "PS5",
    dateEarned: "February 28, 2024",
    rarity: 5.8,
    timeToPlatinum: "124h 15m",
    order: 46,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    gameTitle: "Horizon Forbidden West",
    platform: "PS5",
    dateEarned: "January 12, 2024",
    rarity: 7.3,
    timeToPlatinum: "62h 45m",
    order: 45,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 4,
    gameTitle: "Spider-Man 2",
    platform: "PS5",
    dateEarned: "December 3, 2023",
    rarity: 12.1,
    timeToPlatinum: "35h 20m",
    order: 44,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 5,
    gameTitle: "Final Fantasy XVI",
    platform: "PS5",
    dateEarned: "November 18, 2023",
    rarity: 8.9,
    timeToPlatinum: "58h 12m",
    order: 43,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 6,
    gameTitle: "Resident Evil 4 Remake",
    platform: "PS5",
    dateEarned: "October 5, 2023",
    rarity: 6.7,
    timeToPlatinum: "42h 30m",
    order: 42,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 7,
    gameTitle: "Baldur's Gate 3",
    platform: "PS5",
    dateEarned: "September 22, 2023",
    rarity: 0.1,
    timeToPlatinum: "156h 45m",
    order: 41,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 8,
    gameTitle: "The Last of Us Part II",
    platform: "PS4",
    dateEarned: "August 14, 2023",
    rarity: 15.2,
    timeToPlatinum: "38h 15m",
    order: 40,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 9,
    gameTitle: "Bloodborne",
    platform: "PS4",
    dateEarned: "July 29, 2023",
    rarity: 5.5,
    timeToPlatinum: "67h 22m",
    order: 39,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 10,
    gameTitle: "Ghost of Tsushima",
    platform: "PS5",
    dateEarned: "June 15, 2023",
    rarity: 9.8,
    timeToPlatinum: "54h 10m",
    order: 38,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 11,
    gameTitle: "Demon's Souls",
    platform: "PS5",
    dateEarned: "May 8, 2023",
    rarity: 4.9,
    timeToPlatinum: "72h 35m",
    order: 37,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 12,
    gameTitle: "Ratchet & Clank",
    platform: "PS5",
    dateEarned: "April 20, 2023",
    rarity: 18.3,
    timeToPlatinum: "28h 45m",
    order: 36,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 13,
    gameTitle: "Returnal",
    platform: "PS5",
    dateEarned: "March 30, 2023",
    rarity: 2.8,
    timeToPlatinum: "89h 20m",
    order: 35,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 14,
    gameTitle: "Persona 5 Royal",
    platform: "PS5",
    dateEarned: "February 14, 2023",
    rarity: 11.4,
    timeToPlatinum: "145h 30m",
    order: 34,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 15,
    gameTitle: "Death Stranding",
    platform: "PS5",
    dateEarned: "January 5, 2023",
    rarity: 6.1,
    timeToPlatinum: "68h 15m",
    order: 33,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 16,
    gameTitle: "Sekiro",
    platform: "PS4",
    dateEarned: "December 10, 2022",
    rarity: 3.9,
    timeToPlatinum: "78h 40m",
    order: 32,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 17,
    gameTitle: "Control",
    platform: "PS5",
    dateEarned: "November 22, 2022",
    rarity: 8.2,
    timeToPlatinum: "44h 25m",
    order: 31,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 18,
    gameTitle: "Hades",
    platform: "PS5",
    dateEarned: "October 15, 2022",
    rarity: 14.6,
    timeToPlatinum: "52h 10m",
    order: 30,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 19,
    gameTitle: "Stray",
    platform: "PS5",
    dateEarned: "September 28, 2022",
    rarity: 22.7,
    timeToPlatinum: "12h 20m",
    order: 29,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 20,
    gameTitle: "Uncharted 4",
    platform: "PS4",
    dateEarned: "August 7, 2022",
    rarity: 13.8,
    timeToPlatinum: "36h 50m",
    order: 28,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 21,
    gameTitle: "God of War (2018)",
    platform: "PS4",
    dateEarned: "July 19, 2022",
    rarity: 7.9,
    timeToPlatinum: "51h 40m",
    order: 27,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 22,
    gameTitle: "Astro's Playroom",
    platform: "PS5",
    dateEarned: "June 30, 2022",
    rarity: 45.3,
    timeToPlatinum: "6h 15m",
    order: 26,
    imageUrl: "https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBhcnR3b3JrfGVufDF8fHx8MTc3NDI5MTU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 23,
    gameTitle: "Miles Morales",
    platform: "PS5",
    dateEarned: "May 12, 2022",
    rarity: 17.2,
    timeToPlatinum: "22h 30m",
    order: 25,
    imageUrl: "https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGdhbWUlMjBjb3ZlciUyMGFydHxlbnwxfHx8fDE3NzQyOTE1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 24,
    gameTitle: "Sifu",
    platform: "PS5",
    dateEarned: "April 3, 2022",
    rarity: 1.2,
    timeToPlatinum: "94h 15m",
    order: 24,
    imageUrl: "https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5c3RhdGlvbiUyMGNvbnRyb2xsZXIlMjBnYW1pbmd8ZW58MXx8fHwxNzc0MjkxNTc5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 25,
    gameTitle: "Kena Bridge of Spirits",
    platform: "PS5",
    dateEarned: "March 16, 2022",
    rarity: 10.5,
    timeToPlatinum: "31h 45m",
    order: 23,
    imageUrl: "https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2FtaW5nJTIwbmVvbnxlbnwxfHx8fDE3NzQyOTE1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export const mockProfile = {
  username: "CHIPO_97",
  psnLevel: 500,
  totalPlatinums: 142,
  avatar: "https://images.unsplash.com/photo-1754300681803-61eadeb79d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0cm9waHklMjBnb2xkfGVufDF8fHx8MTc3NDE4MjMzOXww&ixlib=rb-4.1.0&q=80&w=1080",
  rarestPlatinum: mockTrophies[6] // Baldur's Gate 3 - 0.1%
};
