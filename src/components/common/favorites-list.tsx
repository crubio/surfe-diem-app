import { useFavorites } from "providers/favorites-provider";
//TODO: finish this component later
const FavoritesList = () => {
  const { favorites } = useFavorites()
  console.log(favorites)
  return (
    <div>
      <h1>My spots</h1>
    </div>
  )
}

export default FavoritesList;