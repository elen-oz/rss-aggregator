export default (responseData, url = null) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(responseData, 'text/xml');

  const parserError = xmlDocument.querySelector('parsererror');
  if (parserError) {
    const error = new Error(parserError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const channel = xmlDocument.querySelector('channel');
  const channelTitle = xmlDocument.querySelector('channel title').textContent;
  const channelDescription = xmlDocument.querySelector(
    'channel description',
  ).textContent;

  const itemElements = channel.getElementsByTagName('item');
  const items = [...itemElements].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('channel link').textContent;

    return { title, description, link };
  });

  const parsedData = {
    title: channelTitle,
    description: channelDescription,
    link: url,
    items,
  };

  return parsedData;
};
