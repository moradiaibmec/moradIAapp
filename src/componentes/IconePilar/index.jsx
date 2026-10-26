import { LuBriefcase, LuCloudSun, LuDrama, LuGraduationCap, LuShieldCheck, LuStethoscope, LuTrees, LuWallet } from 'react-icons/lu';

const ICONES = {
    custo: LuWallet,
    seguranca: LuShieldCheck,
    clima: LuCloudSun,
    trabalho: LuBriefcase,
    saude: LuStethoscope,
    educacao: LuGraduationCap,
    lazer: LuDrama,
    natureza: LuTrees,
};

function IconePilar({ pilar }) {
    const Icone = ICONES[pilar];
    return <Icone aria-hidden="true" />;
}

export default IconePilar
