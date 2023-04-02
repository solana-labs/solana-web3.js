#!/bin/bash

# Run this script when you want to start a test validator.
# Multiple callers can invoke this script.
# Only the first caller will start the test validator.
# Only the last caller to release the lock will shut the validator down.

EXCLUSIVE_LOCK_FILE="/var/lock/.solanatestvalidator.exclusivelock"
SHARED_LOCK_FILE="/var/lock/.solanatestvalidator.sharedlock"
TEST_VALIDATOR=$HOME/.local/share/solana/install/active_release/bin/solana-test-validator
TEST_VALIDATOR_LEDGER="$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )/test-ledger"

(
  trap : INT # Resume execution any time we receive SIGINT
  # Obtain lock on $SHARED_LOCK_FILE (fd 200)
  flock -s 200 || exit 1
  (
    if flock -nx 200; then
      $TEST_VALIDATOR --ledger $TEST_VALIDATOR_LEDGER --reset --quiet >/dev/null &
      validator_pid=$!
      echo "Started test validator (PID $validator_pid)"
      wait
    else
      echo "Sharing lock on already running test validator (PID $(pidof $TEST_VALIDATOR))"
      sleep infinity
    fi
  ) 200>$EXCLUSIVE_LOCK_FILE
  validator_pid=$(pidof $TEST_VALIDATOR)
  if (exit $?) && ! lsof -p ^$BASHPID -p ^$validator_pid $SHARED_LOCK_FILE >/dev/null; then
    # We are the last caller with a lock. Kill the validator now.
    echo "Terminating test validator (PID $validator_pid)"
    kill -n 15 $validator_pid
    # Wait until we are the last caller with the lock. This way when we exit, we know the lock dies.
    (flock -x 200) 200>$EXCLUSIVE_LOCK_FILE
  else
    echo "Leaving test validator (PID $validator_pid) running for other lock participants"
  fi
) 200>$SHARED_LOCK_FILE