import { useState } from "react";
import Input from "../ui/Input/input";
import Button from "../../../src/components/ui/Button/button";
import { validateRSS } from "../../utils/validators";

const FeedForm = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const validation = validateRSS(url);

    validation ? setError(validation) : setError("");
  };

  return (
    <div>
      <Input
        label="RSS Feed"
        value={url}
        onChange={setUrl}
        placeholder="https://example.com/rss"
        error={error}
      />

      <Button text="Add Feed" onClick={handleSubmit} />
    </div>
  );
};

export default FeedForm;