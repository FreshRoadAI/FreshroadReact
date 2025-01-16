import * as sdk from "@d-id/client-sdk"

const agentId = "agt_yoyGWjkH"
const auth = { type: 'key', clientKey: "YXV0aDB8NjZlMjhiNTE0NWNkMWZjOWZmZmYzNzMxOlZWYVJqYUpCemRvdnJqNE5jSTZwdA==" }
const streamOptions = { compatibilityMode: "auto", streamWarmup: true }

let videoElement
let agentManager
let srcObject

const callbacks = {
  onSrcObjectReady: value => {
    videoElement.srcObject = srcObject = value
    return srcObject
  },
  onVideoStateChange: state => {
    if (state == "STOP") {
      videoElement.muted = true
      videoElement.srcObject = undefined
      videoElement.src = agentManager.agent.presenter.idle_video
    } else {
      videoElement.muted = false
      videoElement.src = ""
      videoElement.srcObject = srcObject
    }
  },
  onError: (error, errorData) => console.log("Error:", error, "Error Data", errorData)
}

export const speak = txt => agentManager.speak({ type: "text", input: txt })

export const setupAgent = async () => {
  agentManager = await sdk.createAgentManager(agentId, { auth, callbacks, streamOptions });
  videoElement = document.querySelector("#videoElement")
  videoElement.style.backgroundImage = `url(${agentManager.agent.presenter.source_url})`
  await agentManager.connect()
}
