# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :monitor_server, MonitorServerWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "bw2bp3dU5vOZCceFk2imPVdntOKJtydeuJVxQUUtw1W8gEQX9h9usIxFYGxh965V",
  render_errors: [view: MonitorServerWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: MonitorServer.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
