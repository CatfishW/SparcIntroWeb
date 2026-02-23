export interface DialogueOption {
  label: string;
  nextId: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
  voiceFile: string;
}
