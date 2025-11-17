import { UsersIcon } from "lucide-react";
import { getFormatter } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ProjectParticipantWithUser } from "./participant-types";

interface ParticipantsListProps {
  participants: ProjectParticipantWithUser[];
}

export default async function ParticipantsList({
  participants,
}: ParticipantsListProps) {
  const format = await getFormatter();

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">
          Participants ({participants?.length || 0})
        </h2>
      </div>

      {!participants || participants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No participants yet</EmptyTitle>
            <EmptyDescription>
              Share the participation link to invite people to this project.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <Avatar>
                <AvatarImage
                  src={participant.user.image || undefined}
                  alt={participant.user.name}
                />
                <AvatarFallback>
                  {participant.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{participant.user.name}</p>
                <p className="text-muted-foreground text-sm">
                  {participant.user.email}
                </p>
              </div>
              <div className="text-muted-foreground text-sm">
                Joined{" "}
                {format.dateTime(participant.createdAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
