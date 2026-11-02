export interface RoutineStepData {
  id: number;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  imageUrl?: string;
  durationSeconds?: number;
}

export interface RoutineFlow {
  id: string;
  title: string;
  titleEs?: string;
  steps: RoutineStepData[];
}
