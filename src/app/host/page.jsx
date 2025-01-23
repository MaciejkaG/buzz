"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initSocket, getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Snippet,
  Spacer,
  Checkbox,
  Button,
  Tooltip
} from "@heroui/react";

import "@/styles/host.css";

export default function Host() {
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [buzzOrder, setBuzzOrder] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const socket = initSocket();

    socket.emit("create-room", (roomId) => {
      setRoomId(roomId);
    });

    socket.on("playerlist-update", ({ players }) => {
      setPlayers(players);
    });

    socket.on("buzzer-update", ({ buzzOrder }) => {
      setBuzzOrder(buzzOrder);
    });

    socket.on("lock-update", ({ isLocked }) => {
      setIsLocked(isLocked);
    });

    socket.on("buzzer-reset", () => {
      setBuzzOrder([]);
    });

    return () => {
      socket.off("player-joined");
      socket.off("buzz-update");
      socket.off("lock-update");
      socket.off("buzzer-reset");
    };
  }, []);

  const handleToggleLock = () => {
    const socket = getSocket();
    socket.emit("toggle-lock", { roomId });
  };

  const handleReset = () => {
    const socket = getSocket();
    socket.emit("reset-buzzer", { roomId });
  };

  const handleKickPlayer = (playerId) => {
    const socket = getSocket();
    socket.emit("kick-player", { roomId, playerId });
  };

  return (
    <div className="mt-16 mx-4 flex gap-4 items-start flex-wrap">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex-1 min-w-fit">
          <CardBody>
            <h2 className="text-3xl text-nowrap font-bold flex items-center justify-between">
              Kod pokoju:{" "}
              <Snippet
                hideSymbol
                disableTooltip
                color="primary"
                className="text-4xl"
              >
                {roomId}
              </Snippet>
            </h2>
            <Spacer y={4} />
            <h2 className="text-2xl text-nowrap flex items-center justify-between">
              Dołącz na:{" "}
              <Snippet
                hideSymbol
                disableTooltip
                color="secondary"
                className="text-3xl"
              >
                buzz.mcjk.cc
              </Snippet>
            </h2>
          </CardBody>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex justify-between items-center">
            <h2>Połączeni gracze</h2>
            <Checkbox defaultSelected>Zablokuj dołączanie</Checkbox>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Example player list */}
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Card className="bg-default-100 mb-2">
                    <CardBody>
                      <p className="flex justify-between items-center">
                        <span>{player}</span>
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => handleKickPlayer(player)}
                        >
                          Wyrzuć
                        </Button>
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardBody>
        </Card>
      </div>
      <div className="flex-1 min-w-fit">
        <Card className="flex-1">
          <CardHeader className="flex justify-between items-center">
            <h2>Historia buzzerów</h2>
            <Checkbox defaultSelected>Zablokuj buzzery</Checkbox>
          </CardHeader>
          <Divider />
          <CardBody>
            <p>test</p>
          </CardBody>
        </Card>
      </div>
      <div className="flex-1 min-w-fit">
        <Card className="flex-1">
          <CardHeader>
            <h2>Ustawienia pokoju</h2>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-hidden">
            <span className="flex items-center justify-between">
              <Tooltip
                className="max-w-96"
                placement="under"
                content="Umożliwia mitygację problemów spowodowanych opóźnieniem w przesyle danych między serwerem a klientem stosując synchronizację czasu i pomiar RTT."
              >
                Korekcja opóźnienia
              </Tooltip>
              <Checkbox defaultSelected />
            </span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
