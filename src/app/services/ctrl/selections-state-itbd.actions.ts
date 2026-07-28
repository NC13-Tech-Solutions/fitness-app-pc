import { ItemsToBeDeletedData } from 'src/app/shared/models/items-to-be-deleted-data.model';

/**
 * Adds a new data to the deletion queue.
 *
 * @param queue The array representing the deletion queue.
 * @param newData The new {@link ItemsToBeDeletedData} object to be added to the queue.
 * @returns The updated deletion `queue`.
 */
export function addToDeleteQueue(
  queue: ItemsToBeDeletedData[],
  newData: ItemsToBeDeletedData,
): ItemsToBeDeletedData[] {
  const newQueue = [...queue, newData];
  return newQueue;
}

/**
 * Clears all {@link ItemsToBeDeletedData} objects from the deletion queue by processing each object sequentially.
 *
 * @param queue The array representing the deletion queue.
 * @param deletionFunction A function that deletes a {@link ItemsToBeDeletedData} object and returns a promise resolving to a status code.
 * @returns An empty `ItemsToBeDeletedData[]` after all objects are processed.
 */
export function clearQueue(
  queue: ItemsToBeDeletedData[],
  deletionFunction: (url: ItemsToBeDeletedData | null) => Promise<number>,
): ItemsToBeDeletedData[] {
  // Check if the queue has any data to process
  if (queue.length > 0) {
    // Copies the queue and sends it for processing
    const newQueue = [...queue];
    clearData(newQueue, deletionFunction);
  }
  return [];
}

/**
 * Removes specific {@link ItemsToBeDeletedData} objects from the deletion queue.
 *
 * @param queue The array representing the deletion queue.
 * @param data The objects to be removed from the queue.
 * @returns A new array with the specified objects removed.
 */
export function removeItemsFromQueue(
  queue: ItemsToBeDeletedData[],
  data: ItemsToBeDeletedData[],
): ItemsToBeDeletedData[] {
  // Filter the queue to exclude any URLs that are present in the `url` array
  return queue.filter((value) => {
    // Check if the current value is in the `data` array
    if (checkIfItemIsInArray(data, value)) return undefined;
    // If the value is in the `data` array, exclude it from the result
    // Else return the value
    return value;
  });
}

/**
 * Check if value is in {@link ItemsToBeDeletedData} objects array
 *
 * @param array
 * @param value
 * @returns
 */
export function checkIfItemIsInArray(
  array: ItemsToBeDeletedData[],
  value: ItemsToBeDeletedData,
): boolean {
  for (let item of array) {
    if (
      value.type === item.type &&
      value.fileName.indexOf(item.fileName) > -1
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Clears all {@link ItemsToBeDeletedData} objects from the deletion queue by processing each object sequentially.
 *
 * @param queue The array representing the deletion queue.
 * @param deletionFunction A function that deletes a {@link ItemsToBeDeletedData} object and returns a promise resolving to a status code.
 */
export async function clearData(
  queue: ItemsToBeDeletedData[],
  deletionFunction: (url: ItemsToBeDeletedData | null) => Promise<number>,
) {
  // Check if the queue has any items to process
  if (queue.length > 0) {
    // Call the deletion function for the first item in the queue
    const val = await deletionFunction(queue[0]);
    console.log(typeof val);
    if (val == 1) {
      // File deletion was successful, remove the first element from the queue
      const newQueue = queue.slice(1);
      console.log('New Queue');
      console.log(newQueue);
      // Recursively call clearData to process the next item
      clearData(newQueue, deletionFunction);
    } else {
      console.log('Delete Unsuccessful Queue');
      console.log(queue);
      // File Deletion was unsuccessful, so recursively calling clearData to process the item again
      clearData(queue, deletionFunction);
    }
  } else {
    // The queue is cleared, so sending null data to resolve
    await deletionFunction(null);
  }
}
