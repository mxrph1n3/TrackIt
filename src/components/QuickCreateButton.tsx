import { ActionHubButton } from './actionHub/ActionHubButton';

type QuickCreateButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  onFavoriteSelect?: (actionId: never) => void;
  favorites?: never;
};

/** Tab-bar entry point for the TrackIt Action Hub crystal. */
export function QuickCreateButton({ isOpen, onToggle }: QuickCreateButtonProps) {
  return <ActionHubButton isOpen={isOpen} onToggle={onToggle} />;
}
