// export interface InterviewQuestion {
//   id: string;
//   text: string;
//   category: "career" | "leadership" | "innovation" | "vision" | "personal";
//   displayOrder: number;
// }

// export interface InterviewAnswer {
//   questionId: string;
//   questionText: string;
//   answer: string;
//   category: string;
//   timestamp: number;
// }

// export interface ChatMessage {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   timestamp: number;
// }

// export interface InterviewSession {
//   id: string;
//   candidateName: string;
//   candidateEmail: string;
//   candidateRole: string;
//   startedAt: number;
//   completedAt?: number;
//   answers: InterviewAnswer[];
//   chatMessages?: ChatMessage[];
// }

// export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
//   {
//     id: "q1",
//     text: "What drives your passion for technology and innovation?",
//     category: "personal",
//     displayOrder: 1,
//   },
//   {
//     id: "q2",
//     text: "How do you approach building and leading high-performing teams?",
//     category: "leadership",
//     displayOrder: 2,
//   },
//   {
//     id: "q3",
//     text: "What is your vision for the future of technology in business?",
//     category: "vision",
//     displayOrder: 3,
//   },
//   {
//     id: "q4",
//     text: "Can you share an example of how you've driven significant innovation in a previous role?",
//     category: "innovation",
//     displayOrder: 4,
//   },
//   {
//     id: "q5",
//     text: "What are the most important qualities you look for in team members?",
//     category: "leadership",
//     displayOrder: 5,
//   },
//   {
//     id: "q6",
//     text: "How do you stay ahead of industry trends and continuously learn?",
//     category: "career",
//     displayOrder: 6,
//   },
// ];
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface InterviewSession {
  id: string;
  // Interviewer (the person opening the app and conducting the interview)
  interviewerName: string;
  interviewerEmail: string;
  interviewerOffice: string;
  // Job being interviewed for
  jobTitle: string;
  jobDescription: string;
  startedAt: number;
  completedAt?: number;
  answers: InterviewAnswer[];
  chatMessages?: ChatMessage[];
}

export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q1",
    text: "Tell me about yourself and what makes you a strong candidate for this role.",
    category: "personal",
    displayOrder: 1,
  },
  {
    id: "q2",
    text: "What relevant experience and skills do you bring to this position?",
    category: "career",
    displayOrder: 2,
  },
  {
    id: "q3",
    text: "How do you approach learning new technologies or systems quickly?",
    category: "innovation",
    displayOrder: 3,
  },
  {
    id: "q4",
    text: "Can you describe a challenging situation you faced at work and how you resolved it?",
    category: "leadership",
    displayOrder: 4,
  },
  {
    id: "q5",
    text: "Where do you see yourself professionally in the next few years?",
    category: "vision",
    displayOrder: 5,
  },
  {
    id: "q6",
    text: "Why are you interested in this role and what value would you bring to our team?",
    category: "career",
    displayOrder: 6,
  },
];