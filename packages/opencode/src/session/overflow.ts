import type { Config } from "@/config"
import type { Provider } from "@/provider"
import { maxOutputTokens } from "@/provider/transform"
import type { MessageV2 } from "./message-v2"

const COMPACTION_SAFETY_BUFFER = 4096

export function usable(input: { cfg: Config.Info; model: Provider.Model }) {
  const contextLimit = input.model.limit.context
  if (contextLimit === 0) return 0

  const effectiveOutput = maxOutputTokens(input.model)
  return Math.max(0, contextLimit - effectiveOutput - COMPACTION_SAFETY_BUFFER)
}

export function isOverflow(input: { cfg: Config.Info; tokens: MessageV2.Assistant["tokens"]; model: Provider.Model }) {
  if (input.cfg.compaction?.auto === false) return false
  if (input.model.limit.context === 0) return false

  const count =
    input.tokens.total || input.tokens.input + input.tokens.output + input.tokens.cache.read + input.tokens.cache.write
  return count >= usable(input)
}
