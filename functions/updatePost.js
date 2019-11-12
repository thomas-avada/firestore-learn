module.exports = async function (snap, context) {
  const updatedPost = snap.after.data()

  const toDateReviews = await db.collection('reviews')
    .where('post.id', '==', snap.id)
    .get()

  toDateReviews.docs.forEach(async doc => {
    await doc.ref.update({
      title: updatedPost.title
    })
  })
}
