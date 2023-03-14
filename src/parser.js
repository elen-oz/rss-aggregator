// Parse RSS feed and generate feed and post identifiers
// function parseRSS(xmlString) {
//   const parser = new DOMParser();
//   const xml = parser.parseFromString(xmlString, 'application/xml');

//   const feedTitle = xml.querySelector('channel > title').textContent;
//   const feedDescription = xml.querySelector('channel > description').textContent;

//   const postElements = xml.querySelectorAll('item');
//   const posts = [];
//   postElements.forEach((postElement, index) => {
//     const postTitle = postElement.querySelector('title').textContent;
//     const postDescription = postElement.querySelector('description').textContent;
//     const postId = `post-${index}`;
//     posts.push({ id: postId, title: postTitle, description: postDescription });
//   });

//   const feedId = `feed-${Date.now()}`;
//   const feed = {
//     id: feedId, title: feedTitle, description: feedDescription, posts,
//   };
//   return feed;
// }

// export default parseRSS;
