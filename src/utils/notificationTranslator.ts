interface Notification {
  type: string;
  title: string;
  message: string;
  related_id?: string | null;
}

interface TranslationContext {
  t: (key: string) => string;
  currentLang: string;
}

/**
 * Translates notification titles and messages based on notification type
 * Handles dynamic data substitution (reviewer names, property titles, ratings, etc.)
 */
export const translateNotification = (
  notification: Notification,
  context: TranslationContext
): { translatedTitle: string; translatedMessage: string } => {
  const { t, currentLang } = context;

  // Map notification types to translation keys
  const typeKey = `notificationTypes.${notification.type}`;
  
  // Try to get translated title and message
  const translatedTitle = t(`${typeKey}.title`);
  const translatedMessage = t(`${typeKey}.message`);

  // If translation exists and is different from the key (not "notificationTypes.xxx.title"),
  // use the translation. Otherwise, fallback to database values
  const shouldUseTranslation = 
    translatedTitle && 
    !translatedTitle.startsWith('notificationTypes.') &&
    translatedMessage && 
    !translatedMessage.startsWith('notificationTypes.');

  if (shouldUseTranslation) {
    // Parse database message to extract dynamic values
    let processedMessage = translatedMessage;

    // Extract reviewer name from messages like "John left a 5-star review..."
    const reviewerMatch = notification.message.match(/^([^left]+)\s+left/);
    if (reviewerMatch) {
      processedMessage = processedMessage.replace('{reviewer}', reviewerMatch[1].trim());
    }

    // Extract rating (e.g., "5-star")
    const ratingMatch = notification.message.match(/(\d+)-star/);
    if (ratingMatch) {
      processedMessage = processedMessage.replace('{rating}', ratingMatch[1]);
    }

    // Extract property title (between quotes)
    const propertyMatch = notification.message.match(/"([^"]+)"/);
    if (propertyMatch) {
      processedMessage = processedMessage.replace('{property}', propertyMatch[1]);
    }

    // Extract sender name for message notifications
    const senderMatch = notification.message.match(/^([^sent]+)\s+sent/);
    if (senderMatch) {
      processedMessage = processedMessage.replace('{sender}', senderMatch[1].trim());
    }

    // Extract lawyer name for lawyer approval notifications
    const lawyerMatch = notification.message.match(/contact\s+([^has]+)\s+has/);
    if (lawyerMatch) {
      processedMessage = processedMessage.replace('{lawyer}', lawyerMatch[1].trim());
    }

    // Extract rejection reason for KYC rejections
    const reasonMatch = notification.message.match(/Reason:\s*(.+)$/);
    if (reasonMatch) {
      processedMessage = processedMessage.replace('{reason}', reasonMatch[1].trim());
    }

    return {
      translatedTitle,
      translatedMessage: processedMessage
    };
  }

  // Fallback to database values if no translation available
  return {
    translatedTitle: notification.title,
    translatedMessage: notification.message
  };
};
