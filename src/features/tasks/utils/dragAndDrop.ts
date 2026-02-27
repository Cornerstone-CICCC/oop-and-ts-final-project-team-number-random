const TASK_ID_DATA_KEY = "text/plain";

export function setDraggedTaskId(dataTransfer: DataTransfer | null, taskId: string): void {
  if (!dataTransfer) {
    return;
  }

  dataTransfer.setData(TASK_ID_DATA_KEY, taskId);
  dataTransfer.effectAllowed = "move";
}

export function getDraggedTaskId(dataTransfer: DataTransfer | null): string {
  if (!dataTransfer) {
    return "";
  }

  return dataTransfer.getData(TASK_ID_DATA_KEY);
}
