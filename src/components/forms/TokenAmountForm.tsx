import SelectToken from "./SelectToken";

interface TokenAmountFormProps {

}

function TokenAmountForm({}: TokenAmountFormProps) {
  const [tokenInId, setTokenInId] = useState<string>();
  const [tokenInAmount, setTokenInAmount] = useState<string>();
  const [tokenOutId, setTokenOutId] = useState<string>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>();

  return (
    <form onSubmit={}>
      <input
        type="number"
        placeholder="0.0"
        value={tokenInAmount}
        onChange={({ target }) => setTokenInAmount(target.value)}
      />
      <SelectToken
        selected={tokenInId}
        onSelect={(tokenId) => setTokenInId(tokenId)}
      />
      <input type="number" placeholder="0.0" value={tokenOutAmount} />
      <SelectToken
        selected={tokenOutId}
        onSelect={(tokenId) => setTokenOutId(tokenId)}
      />
      <button></button>
    </form>
  );
}
