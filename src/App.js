import React, { useEffect, useState } from 'react'
import '@shopify/polaris/styles.css'

function App () {
  const [reviews, setReviews] = useState([])
  async function fetchReviews () {
    try {
      const data = await fetch('/api/reviews')
      const reviews = await data.json()
      setReviews(reviews.reviews)
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    fetchReviews()
  }, [])
  return (
    <React.Fragment>
      <h1>This is an react app</h1>
      <ul>
        {
          reviews.map((review, key) => (
            <li key={key}>{review.body}</li>
          ))
        }
      </ul>
    </React.Fragment>
  )
}

export default App
