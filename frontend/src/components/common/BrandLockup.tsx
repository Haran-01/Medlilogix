import medilogixLogo from '../../assets/medilogix-logo.png';
import senstimLogo from '../../assets/senstim-logo.jpeg';

type BrandLockupVariant = 'auth' | 'header';

interface BrandLockupProps {
  className?: string;
  variant?: BrandLockupVariant;
}

export function BrandLockup({ className = '', variant = 'auth' }: BrandLockupProps) {
  if (variant === 'header') {
    return (
      <span className={`flex min-w-0 items-center gap-3 ${className}`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#e1e7f2] bg-white shadow-sm">
          <img alt="MediLogiX" className="h-7 w-auto object-contain" src={medilogixLogo} />
        </span>
        <span className="text-xl font-extrabold tracking-normal text-[#07194c]">Medilogix</span>
        <span aria-hidden="true" className="hidden h-8 w-px bg-[#dfe7f2] sm:block" />
        <img
          alt="SenStim PNS, TOF Monitor"
          className="hidden h-9 max-w-[142px] object-contain sm:block"
          src={senstimLogo}
        />
      </span>
    );
  }

  return (
    <div className={`mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-3 ${className}`}>
      <img alt="MediLogiX" className="h-12 w-auto object-contain" src={medilogixLogo} />
      <span aria-hidden="true" className="hidden h-10 w-px bg-[#dfe7f2] sm:block" />
      <img alt="SenStim PNS, TOF Monitor" className="h-14 max-w-[196px] object-contain" src={senstimLogo} />
    </div>
  );
}
