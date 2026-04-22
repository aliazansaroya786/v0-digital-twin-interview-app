export interface InterviewQuestion {
  id: string;
  text: string;
  category: "career" | "leadership" | "innovation" | "vision" | "personal";
  displayOrder: number;
}

export interface InterviewAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  category: string;
  timestamp: number;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  startedAt: number;
  completedAt?: number;
  answers: InterviewAnswer[];
}

export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q1",
    text: "What drives your passion for technology and innovation?",
    category: "personal",
    displayOrder: 1,
  },
  {
    id: "q2",
    text: "How do you approach building and leading high-performing teams?",
    category: "leadership",
    displayOrder: 2,
  },
  {
    id: "q3",
    text: "What is your vision for the future of technology in business?",
    category: "vision",
    displayOrder: 3,
  },
  {
    id: "q4",
    text: "Can you share an example of how you've driven significant innovation in a previous role?",
    category: "innovation",
    displayOrder: 4,
  },
  {
    id: "q5",
    text: "What are the most important qualities you look for in team members?",
    category: "leadership",
    displayOrder: 5,
  },
  {
    id: "q6",
    text: "How do you stay ahead of industry trends and continuously learn?",
    category: "career",
    displayOrder: 6,
  },
];
